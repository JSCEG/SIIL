import requests
base = 'https://gaia.inegi.org.mx/wscatgeo/'
candidates = [
    'loc/26030',
    'loc/26/030',
    'localidad/26030',
    'localidad/26/030',
    'locgeo/26030',
    'ageeml/26030',
    'ageeml/26/030',
    'loco/26030',
    'loc/26',
    'aloc/26030',
    'mgel/26030',
    'mgel/26/030',
    'loc/260300001',
    'mgel/26030/0001',
]
for path in candidates:
    url = base + path
    try:
        r = requests.get(url, timeout=12)
        print(f'{r.status_code} {url}')
        if r.status_code == 200:
            print((r.text[:220]).replace('\n',' '))
    except Exception as e:
        print('ERR', url, e)
