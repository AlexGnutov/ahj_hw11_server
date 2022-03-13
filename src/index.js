const http = require('http');
const faker = require('faker');
const Koa = require('koa');
const Router = require('@koa/router');
const koaBody = require('koa-body');

// Messages creation every 20 with probability close to 0.5
const messages = [];
const interval = setInterval(() => {
    const newMessage = {
        id: faker.datatype.uuid(),
        from: faker.internet.email(),
        subject: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        received: Date.now(),
    }
    console.log(newMessage);
    messages.push(newMessage);
}, 5000);

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
        messages,
    });
});

app.use(router.routes()).use(router.allowedMethods());
const port = process.env.PORT || 8080;
const server = http.createServer(app.callback()).listen(port);
