const http = require("http");
const { v4 } = require("uuid");
const { read_file, write_file } = require("./fs/fs_api");
const url = require("url");

const options = {
  "content-type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

let app = http.createServer(async (req, res) => {
  user_id = req.url.split("/")[2];

  if (req.method === "GET") {
    if (req.url === "/users") {
      let users = read_file("users.json");
      res.writeHead(200, { "content-type": "application/json" });
      await res.end(JSON.stringify(users));
    }

    if (req.url === `/user/${user_id}`) {
      let foundedUser = read_file("users.json").find((u) => u.id === user_id);
      if (!foundedUser) {
        res.writeHead(404, options);
        return res.end(JSON.stringify({ msg: "User not found!" }));
      }
      res.writeHead(200, options);
      await res.end(JSON.stringify(foundedUser));
    }
  }

  if (req.method === "POST") {
    if (req.url === "/create_user") {
      req.on("data", (chunk) => {
        let data = JSON.parse(chunk);

        let users = read_file("users.json");

        users.push({
          id: v4(),
          ...data,
        });
        write_file("users.json", users);
        res.end(JSON.stringify({ msg: "Create user!" }));
      });
    }
  }

  if (req.method === "PUT") {
    if (req.url === `/update_user/${user_id}`) {
      req.on("data", (new_user) => {
        let newUser = JSON.parse(new_user);
        let { name, email, password, age } = newUser;

        if (!name || !email || !password || !age) {
          res.writeHead(404, options);
          return res.end(
            JSON.stringify({
              msg: "name, email, password, age require?",
            })
          );
        }

        let users = read_file("users.json");

        let foundedUser = users.find((c) => c.id === user_id);

        if (!foundedUser) {
          res.writeHead(404, options);
          return res.end(
            JSON.stringify({
              msg: "User not found!",
            })
          );
        }

        users.forEach((user, idx) => {
          if (user.id === user_id) {
            user.name = name ? name : user.name;
            user.email = email ? email : user.email;
            user.password = password ? password : user.password;
            user.age = age ? age : user.age;
          }
        });

        write_file("users.json", users);

        res.writeHead(200, options);
        res.end(
          JSON.stringify({
            msg: "User Updated!",
          })
        );
      });
    }
  }

  if (req.method === "DELETE") {
    if (req.url === `/delete_user/${user_id}`) {
      let users = read_file("users.json");

      let foundedUser = users.find((c) => c.id === user_id);

      if (!foundedUser) {
        res.writeHead(404, options);
        return res.end(
          JSON.stringify({
            msg: "User not found!",
          })
        );
      }

      users.forEach((user, idx) => {
        if (user.id === user_id) {
          users.splice(idx, 1);
        }
      });

      write_file("users.json", users);

      res.writeHead(200, options);
      res.end(
        JSON.stringify({
          msg: "User Deleted!",
        })
      );
    }
  }
});

app.listen(5000, () => {
  console.log("Server is running on the 5000");
});
