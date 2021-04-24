1.
```bash
scan/client $ export PORT=5000 && yarn start
```

2.
```bash
scan/server $ npx tsc && echo ready && node ./out/server/src/main.js 
```

3. Also install `nginx` and use provided in file `nginx` configuration.

4. Open address `localhost` in the browser.