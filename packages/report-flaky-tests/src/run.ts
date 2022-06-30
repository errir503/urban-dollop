/**
 * External dependencies
 */
import * as github from '@actions/github';
import * as core from '@actions/core';
import type { WorkflowRunCompletedEvent } from '@octokit/webhooks-types';

/**
 * Internal dependencies
 */
import { GitHubAPI } from './github-api';
import {
	renderIssueBody,
	formatTestErrorMessage,
	formatTestResults,
	parseIssueBody,
} from './markdown';

async function run() {
	if (
		github.context.eventName !== 'workflow_run' ||
		github.context.payload.action !== 'completed'
	) {
		return;
	}

	const token = core.getInput( 'repo-token', { required: true } );
	const artifactNamePrefix = core.getInput( 'artifact-name-prefix', {
		required: true,
	} );

	const api = new GitHubAPI( token, github.context.repo );
	// Cast the payload type: https://github.com/actions/toolkit/tree/main/packages/github#webhook-payload-typescript-definitions
	const {
		workflow_run: { head_branch: headBranch, html_url: runURL, id: runID },
	} = github.context.payload as WorkflowRunCompletedEvent;

	const flakyTests = await api.downloadReportFromArtifact(
		runID,
		artifactNamePrefix
	);

	if ( ! flakyTests ) {
		// No flaky tests reported in this run.
		return;
	}

	const label = core.getInput( 'label', { required: true } );
	const issues = await api.fetchAllIssuesLabeledFlaky( label );

	for ( const flakyTest of flakyTests ) {
		const { title: testTitle } = flakyTest;
		const issueTitle = getIssueTitle( testTitle );
		const reportedIssue = issues.find(
			( issue ) => issue.title === issueTitle
		);
		const testPath = flakyTest.path.startsWith( process.cwd() )
			? flakyTest.path.slice( process.cwd().length )
			: flakyTest.path;
		let issue;

		const currentFormattedTestResults = formatTestResults( {
			date: new Date(),
			failedTimes: flakyTest.results.length,
			headBranch,
			runURL,
			// Always output the latest test results' stacks.
			errorMessage: formatTestErrorMessage( flakyTest ),
		} );

		if ( reportedIssue ) {
			const body = reportedIssue.body!;

			// The issue is closed.
			if ( reportedIssue.closed_at ) {
				try {
					// Represent the latest base commit on trunk.
					const latestAncestorCommit = await api.findMergeBaseCommit(
						'trunk',
						github.context.sha
					);
					const latestAncestorDate =
						latestAncestorCommit.committer?.date;

					// Cannot find the commit date, skipping.
					if ( ! latestAncestorDate ) {
						return;
					}

					// The issue is closed after the latest base commit on trunk,
					// which means the branch/PR/commit is outdated and the flaky test
					// has probably already been fixed. Skip reporting the outdated flaky tests.
					if (
						new Date( reportedIssue.closed_at ) >=
						new Date( latestAncestorDate )
					) {
						return;
					}
				} catch ( error ) {
					// It might be a deleted commit or something else.
					core.error(
						error instanceof Error ? error : String( error )
					);
					return;
				}
			}

			const { meta, testResults: prevTestResults } =
				parseIssueBody( body );

			// Concat the test results list with the latest test results.
			const formattedTestResults = [
				...prevTestResults.map( ( testResult ) =>
					formatTestResults( {
						...testResult,
						// Don't output previous test results' stacks.
						errorMessage: undefined,
					} )
				),
				currentFormattedTestResults,
			].join( '\n<br/>\n' );

			issue = await api.updateIssue( {
				issue_number: reportedIssue.number,
				state: 'open',
				body: renderIssueBody( {
					meta,
					testTitle,
					testPath,
					formattedTestResults,
				} ),
			} );
		} else {
			issue = await api.createIssue( {
				title: issueTitle,
				body: renderIssueBody( {
					meta: {},
					testTitle,
					testPath,
					formattedTestResults: currentFormattedTestResults,
				} ),
				labels: [ label ],
			} );
		}

		core.info( `Reported flaky test to ${ issue.html_url }` );
	}
}

function getIssueTitle( testTitle: string ) {
	return `[Flaky Test] ${ testTitle }`;
}

export { run };
