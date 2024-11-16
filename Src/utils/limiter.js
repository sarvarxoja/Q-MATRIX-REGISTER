import rateLimit from "express-rate-limit";

///// BRUT FORCE ATTACK OLDINI OLISH MAQSADIDA ISHLATILADI ///// 

export const loginLimiter = rateLimit({
    windowMs: 20 * 60 * 1000, // 20 daqiqa (millisekundlarda)
    max: 5, // Maksimal 5 ta so'rov
    message: 'You have exceeded the 5 requests in 20 minutes limit!', // Cheklovdan oshganda yuboriladigan xabar
    standardHeaders: true, // `RateLimit-*` sarlavhalarini javobga qo'shadi
    legacyHeaders: false, // Eski `X-RateLimit-*` sarlavhalarini o'chiradi
});