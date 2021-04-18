import * as http from "http";

const host = "localhost";

export type ServerHandle = {
  dispose: () => Promise<void>;
};
export function activateHttpServer<P = any, R = any>(
  port: number,
  exec: (params: P, url: string | undefined) => Promise<R> | R
): Promise<ServerHandle> {
  const server = http
    .createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Request-Method', '*');
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
      res.setHeader('Access-Control-Allow-Headers', '*');
      if ( req.method === 'OPTIONS' ) {
        res.writeHead(200);
        res.end();
        return;
      }
      function end(data: any) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
      }
      let json: any = null;
      req.on("data", data => {
        if (json === null) {
          json = data;
        } else {
          json += data;
        }
      });
      req.on("end", () => {
        const params = JSON.parse(json);
        // tslint:disable-next-line: no-floating-promises
        Promise.resolve(exec(params, req.url)).then(end);
      });
    })
    .listen(port, host);
  const dispose = () => new Promise<void>((resolve, reject) => server.close(err => (err ? reject(err) : resolve())));
  return new Promise((resolve, reject) => {
    server.once("listening", () => resolve({ dispose }));
    server.once("error", reject);
  });
}
