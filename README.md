Fix my imports for me please.

After moving a file in a require.js based codebase, it is super tedious to
change the imports and requires everywhere.

This tool will help you. Call it passing all js files in your codebase as argv
arguments:

```
node ~/work/fix-imports/index.js files.js mini-files.js watch.js ...
```

