#!/usr/bin/env python3
"""Local clone server for wellhello.com.

Serves the mirrored static site from ./site and transparently proxies any
path that does not exist locally (e.g. /v2/api/*, /site/*) to the live
origin so the SPA renders and behaves exactly like the real site.
"""
import http.server
import os
import socketserver
import sys
import urllib.request
import urllib.error

SITE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "site")
ORIGIN = "https://wellhello.com"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

handler_class = http.server.SimpleHTTPRequestHandler


class CloneHandler(handler_class):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SITE_DIR, **kwargs)

    def _proxy(self):
        url = ORIGIN + self.path
        req = urllib.request.Request(url, method=self.command)
        for h, v in self.headers.items():
            if h.lower() not in ("host", "connection", "accept-encoding"):
                req.add_header(h, v)
        req.add_header("Host", "wellhello.com")
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = resp.read()
                self.send_response(resp.status)
                for h, v in resp.headers.items():
                    if h.lower() in ("content-type", "content-encoding", "set-cookie", "cache-control", "expires", "pragma", "location"):
                        self.send_header(h, v)
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
        except urllib.error.HTTPError as e:
            body = e.read()
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            self.send_response(502)
            body = str(e).encode()
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    def do_GET(self):
        local = os.path.normpath(os.path.join(SITE_DIR, self.path.lstrip("/")))
        if self.path in ("/", "/index.html") or (local.startswith(SITE_DIR) and os.path.isfile(local)):
            super().do_GET()
        else:
            self._proxy()

    do_POST = _proxy
    do_PUT = _proxy
    do_OPTIONS = _proxy


class ThreadingServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


if __name__ == "__main__":
    os.chdir(SITE_DIR)
    with ThreadingServer(("127.0.0.1", PORT), CloneHandler) as httpd:
        print(f"clone server listening on http://127.0.0.1:{PORT}", flush=True)
        httpd.serve_forever()
