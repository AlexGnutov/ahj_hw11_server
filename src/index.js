const http = require('http');
const { faker } = require('@faker-js/faker');
const Koa = require('koa');
const Router = require('@koa/router');
const koaBody = require('koa-body');

// Creates from 1 to 4 new messages on request
function getMessages() {
    const messages = [];
    const number = Math.floor(Math.random() * 4 + 1);
    Array(number).fill(1).forEach(() => {
        const newMessage = {
            id: faker.datatype.uuid(),
            from: faker.internet.email(),
            subject: faker.lorem.sentence(),
            body: faker.lorem.paragraph(),
            received: Date.now(),
        };
        messages.push(newMessage);
    });
    return messages;
}

// Server part
const app = new Koa();
const router = new Router();

// Cross-origin middleware
app.use(async (ctx, next) => {
    const origin = ctx.request.get('Origin');
    if (!origin) {
        return await next();
    }
    const headers = { 'Access-Control-Allow-Origin': '*' };
    if (ctx.request.method !== 'OPTIONS') {
        ctx.response.set({...headers});
        try {
            return await next();
        } catch (e) {
            e.headers = {...e.headers, ...headers};
            throw e;
        }
    }
    if (ctx.request.get('Access-Control-Request-Method')) {
        ctx.response.set({
            ...headers,
            'Access-Control-Allow-Methods': 'GET, POST, PUD, DELETE, PATCH',
        });

        if (ctx.request.get('Access-Control-Request-Headers')) {
            ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
        }

        ctx.response.status = 204;
    }
});

app.use(koaBody({
    text: true,
    urlencoded: true,
    multipart: true,
    json: true,
}));

router.get('/messages/unread', async (ctx, next) => {
    if (Math.random() > 0.8) {
        ctx.response.status = 500;
        return;
    }
    ctx.response.body = JSON.stringify({
        status: "ok",
        timestamp: Date.now(),
        messages: getMessages(),
    });
});

app.use(router.routes()).use(router.allowedMethods());
const port = process.env.PORT || 8080;
const server = http.createServer(app.callback()).listen(port);
