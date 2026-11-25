// Keep previously shared review URLs working after separating the demo pages.
const requestedEdition = new URLSearchParams(location.search).get('edition');
if (['photo', 'contents'].includes(requestedEdition)) {
  const filename = location.pathname.split('/').pop() || 'index.html';
  location.replace('demos/' + filename + location.search + location.hash);
}
