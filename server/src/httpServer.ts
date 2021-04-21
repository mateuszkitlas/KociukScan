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
      const headers = {
        'Access-Control-Allow-Methods': 'POST, PUT, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Max-Age': 2592000,
      }
      
      if (req.method === 'OPTIONS' ) {
        console.log("options");
        res.writeHead(204, headers);
        res.end();
      } else if (req.method === 'POST' ) {
        let body: any = [];
        req
          .on("resume", () => console.log("resume"))
          .on("pause", () => console.log("pause"))
          .on("close", () => console.log("close"))
          .on('error', (err) => {
            console.error(err);
          })
          .on('data', (chunk) => {
            console.log("data");
            body.push(chunk);
          })
          .on('end', async () => {
            console.log("end");
            res.on('error', (err) => console.error(err));
            const params = JSON.parse(Buffer.concat(body).toString());
            try {
              const data = await exec(params, req.url);
              res.writeHead(200, headers);
              res.end(JSON.stringify(data));
              console.log("response", data);
            } catch(error) {
              res.writeHead(200, headers);
              res.end(JSON.stringify({ error }));
              console.log("response error", error);
            }
            
          });
      } else {
        res.writeHead(405, headers);
        res.end();
      }
    })
    .on("connection", (socket) => socket.setTimeout(20000))
    .setTimeout(20000)
    .listen(port, host);
  server.keepAliveTimeout = 20000;
  const dispose = () => new Promise<void>((resolve, reject) => server.close(err => (err ? reject(err) : resolve())));
  return new Promise((resolve, reject) => {
    server.once("listening", () => resolve({ dispose }));
    server.once("error", reject);
  });
}
