/**
 * Internal dependencies
 */
const debug = require( '../../debug' );

/** @typedef {import('@actions/github').GitHub} GitHub */
/** @typedef {import('@octokit/webhooks').WebhookPayloadPullRequest} WebhookPayloadPullRequest */

/**
 * Assigns the first-time contributor label to PRs.
 *
 * @param {WebhookPayloadPullRequest} payload Pull request event payload.
 * @param {GitHub}                    octokit Initialized Octokit REST client.
 */
async function firstTimeContributorLabel( payload, octokit ) {
	const repo = payload.repository.name;
	const owner = payload.repository.owner.login;
	const author = payload.pull_request.user.login;

	debug(
		`first-time-contributor: Searching for commits in ${ owner }/${ repo } by @${ author }`
	);

	const { data: commits } = await octokit.repos.listCommits( {
		owner,
		repo,
		author,
	} );

	if ( commits.length > 0 ) {
		debug(
			`first-time-contributor-label: Not the first commit for author. Aborting`
		);
		return;
	}

	const pullRequestNumber = payload.pull_request.number;

	debug(
		`first-time-contributor-label: Adding 'First Time Contributor' label to pr #${ pullRequestNumber }`
	);

	await octokit.issues.addLabels( {
		owner,
		repo,
		issue_number: payload.pull_request.number,
		labels: [ 'First-time Contributor' ],
	} );

	/**
	 * Adds a welcome comment to the first time PR
	 */

	await octokit.issues.createComment( {
		owner,
		repo,
		issue_number: payload.pull_request.number,
		body:
			':wave: Thanks for your first Pull Request and for helping build the future of Gutenberg and WordPress, @' +
			author +
			"! In case you missed it, we'd love to have you join us in our [Slack community](https://make.wordpress.org/chat/), " +
			'where we hold [regularly weekly meetings](https://make.wordpress.org/core/tag/core-editor-summary/) open to anyone to coordinate with each other.\n\n' +
			'If you want to learn more about WordPress development in general, check out the [Core Handbook](https://make.wordpress.org/core/handbook/) full of helpful information.',
	} );
}

module.exports = firstTimeContributorLabel;
