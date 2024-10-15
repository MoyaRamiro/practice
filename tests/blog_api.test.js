const { test, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");
const assert = require("node:assert");
const helper = require("./test_helper.test");

/*
  title: String,
  author: String,
  url: String,
  likes: Number
*/

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  const blogs = helper.initialBlogs;
  
  for(let blog of blogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
});

test.only("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs");

  assert.strictEqual(response.body.length, helper.initialBlogs.length);
});

test("a specific blog is within the returned blogs", async () => {
  const response = await api.get("/api/blogs");

  const contents = response.body.map((r) => r.content);

  assert(contents.includes("Browser can execute only JavaScript"));
});

test("a valid blog can be added ", async () => {
  const newBlog = {
    title: "ciloe",
    author: "charles chaplin",
    url: "asad",
    likes: 5,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

  const contents = blogsAtEnd.map((n) => n.content);
  assert(contents.includes("async/await simplifies making async calls"));
});

test("blog without content is not added", async () => {
  const newBlog = {
    important: true,
  };

  await api.post("/api/blogs").send(newBlog).expect(400);

  const blogsAtEnd = await helper.blogsInDb();

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
});

test("the first blog is about HTTP methods", async () => {
  const response = await api.get("/api/blogs");

  const contents = response.body.map((e) => e.content);
  //assert.strictEqual(contents.includes('HTML is easy'), true)
  assert(contents.includes("ciloe"));
});

test.only("there are two blogs", async () => {
  const response = await api.get("/api/blogs");

  //expect(response.body).toHaveLength(2)
  assert.strictEqual(response.body.length, 2);
});

test("a specific blog can be viewed", async () => {
  const blogsAtStart = await helper.blogsInDb();

  const blogToView = blogsAtStart[0];

  const resultBlog = await api
    .get(`/api/blogs/${blogToView.id}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  assert.deepStrictEqual(resultBlog.body, blogToView);
});

test("a blog can be deleted", async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

  const blogsAtEnd = await helper.blogsInDb();

  const contents = blogsAtEnd.map((r) => r.content);
  assert(!contents.includes(blogToDelete.content));

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);
});

after(async () => {
  await mongoose.connection.close();
});
