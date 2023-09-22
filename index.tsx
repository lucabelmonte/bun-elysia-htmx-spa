import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { randomUUID } from "node:crypto";


import * as elements from "typed-html"


type TodoItem = {
    id?: string;
    name: string;
    description: string;
}

const todos: TodoItem[] = [];


function RenderTodos({ todos }: {todos: TodoItem[]}) {
    return <div>
        {todos.map(todo => <TodoItemComp {...todo} />)}
    </div>
}

function TodoItemComp(props: TodoItem) {
    const url = "/todo/" + props.id;
    return <div>
        <p>name: {props.name}</p>
        <p>description: {props.description}</p>
        <button hx-delete={url} hx-target="#todosList">Delete</button>
    </div>
}

const BaseHtml = ({ children }: elements.Children) => `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>THE BETH STACK</title>
      <script src="https://unpkg.com/htmx.org@1.9.3"></script>
      <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
    </head>
    
    ${children}
`;


function Menu() {
    return <div>
        <button type="button" hx-get="/component/page1" hx-target="#content" hx-swap="innerHTML" hx-replace-url="/page1">Page 1</button>
        <button type="button" hx-get="/component/page2" hx-target="#content" hx-swap="innerHTML" hx-replace-url="/page2">Page 2</button>
    </div>
}


function Page1() {
    return <div>
        <h1>Page 1</h1>
        <form hx-post="/todo" hx-target="#todosList">
            <input type="input" name="name" placeholder="name" value="" />
            <input type="input" name="description" placeholder="description" value="" />
            <button type="submit">Save</button>
        </form>
        <div
            id="todosList"
            hx-get="/todo"
            hx-trigger="load"
            hx-target="this"
            hx-swap="innerHTML"
        ></div>
    </div>
}

function Page2() {
    return <div>
        <h1>Page 2</h1>
    </div>
}


const app = new Elysia()
    .use(html())
    .get("/*", ({ html, path }) => {
        console.log(path)

        let loadComponent = "/component/page1";
        if(path !== "/")
            loadComponent = "/component" + path;

        return html(
        <BaseHtml>
            <body hx-get={loadComponent} hx-trigger="load" hx-target="#content" hx-swap="innerHTML">
                <Menu />
                <div id="content"></div>
            </body>
        </BaseHtml>
    )})
    .get("/todo", () => <RenderTodos todos={todos}/>)
    .post("/todo", ({ body }: any) => {
        todos.push({ id: randomUUID(),  name: body.name, description: body.description });
        return <RenderTodos todos={todos}/>
    })
    .delete("/todo/:uuid", ({ params: { uuid } }) => {
        const id = todos.findIndex(x => x.id === uuid);
        todos.splice(id, 1);
        return <RenderTodos todos={todos}/>
    })

    .get("/component/page1", () => <Page1 />)
    .get("/component/page2", () => <Page2 />)
    .listen(3001)



console.log("Starting on port 3001")