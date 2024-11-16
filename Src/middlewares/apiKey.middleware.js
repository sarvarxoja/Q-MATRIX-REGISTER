const allowedDomains = [
    'http://192.168.1.58:4444',
    'http://192.168.1.131:4444',
    'http://192.168.1.131:3000',
    'http://192.168.1.131:2323',
    'http://192.168.1.58:4445',
    'http://192.168.1.84:2323',
    'http://192.168.1.114:2310',
    'http://192.168.1.114:4445',
    'http://192.168.1.58:4446'
];


export function checkApiKeyAndDomain(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    const origin = req.headers.origin || req.headers.referer;


    if (!allowedDomains.includes(origin)) {
        return res.status(403).json({ msg: 'Доступ запрещен: неавторизованный домен', status: 403 });
    }

    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({ msg: 'Неверный ключ API', status: 403 });
    }

    next();
}