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
      //res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
      res.setHeader('Access-Control-Allow-Headers', '*');
      if (req.method === 'OPTIONS' ) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end();
        return;
      }
      
      let body: any = [];
      req.on('error', (err) => {
        console.error(err);
      }).on('data', (chunk) => {
        body.push(chunk);
      }).on('end', async () => {
        body = Buffer.concat(body).toString();
        // at this point, `body` has the entire request body stored in it as a string
        res.on('error', (err) => {
          console.error(err);
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        const params = JSON.parse(body);
        const data = await exec(params, req.url);
        res.end(JSON.stringify(data));
        console.log("response", data);
      });
    })
    .listen(port, host);
  const dispose = () => new Promise<void>((resolve, reject) => server.close(err => (err ? reject(err) : resolve())));
  return new Promise((resolve, reject) => {
    server.once("listening", () => resolve({ dispose }));
    server.once("error", reject);
  });
}
