#!/usr/bin/env python3
"""
Servidor local con proxy para NASA/ADS.
Uso: python3 server.py
Acceso desde cualquier dispositivo en la red: http://<IP>:8000
"""
import http.server
import urllib.request
import urllib.parse
import os

ADS_TOKEN = 'so2kV7LPYemkQBeSZaH0x8ttWuYVtsDYcFZznclf'
ADS_BASE  = 'https://api.adsabs.harvard.edu/v1/search/query'
PORT      = 8000

class Handler(http.server.SimpleHTTPRequestHandler):

    def do_GET(self):
        if self.path.startswith('/ads-proxy?'):
            self._proxy_ads(self.path[len('/ads-proxy?'):])
        else:
            super().do_GET()

    def _proxy_ads(self, qs):
        url = f'{ADS_BASE}?{qs}'
        req = urllib.request.Request(url, headers={'Authorization': f'Bearer {ADS_TOKEN}'})
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                data = r.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_response(502)
            self.end_headers()
            self.wfile.write(str(e).encode())

    def log_message(self, fmt, *args):
        pass  # silenciar logs de cada petición

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    import socket
    local_ip = socket.gethostbyname(socket.gethostname())
    server = http.server.HTTPServer(('0.0.0.0', PORT), Handler)
    print(f'Servidor activo:')
    print(f'  Este ordenador : http://localhost:{PORT}')
    print(f'  Red local      : http://{local_ip}:{PORT}')
    print(f'  (Ctrl+C para detener)')
    server.serve_forever()
