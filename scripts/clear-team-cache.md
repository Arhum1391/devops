# Clear Team Data Cache

To clear the cached team data in your browser:

1. Open your browser's developer console (F12)
2. Go to the Console tab
3. Run this command:

```javascript
sessionStorage.removeItem('teamData');
sessionStorage.removeItem('lastTeamDataFetch');
location.reload();
```

This will clear the cached team data and reload the page with fresh data from the API.

