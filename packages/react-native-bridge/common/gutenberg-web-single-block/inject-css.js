const injectCss = `
window.injectCss = (css) => {
    const style = document.createElement('style');
    style.innerHTML = css;
    style.type = 'text/css';
    document.head.appendChild(style);
}
`;

const script = document.createElement( 'script' );
script.innerText = injectCss;
script.type = 'text/javascript';
document.head.appendChild( script );
// We need to return a string or null, otherwise executing this script will error.
// eslint-disable-next-line no-unused-expressions
( '' );
