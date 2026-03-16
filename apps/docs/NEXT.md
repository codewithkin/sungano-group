- Plan out what each role should be able to access

(1) Inside the "web" app frontend, create a single reusable object called api, with members like get, post and patch

This function uses axios under the hood for every request, and makes a request to process.env.NEXT_PUBLIC_SERVER_UR

✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅

(2) For every request, make sure you're using tanstack react query, adding laoding logic using isLoasiding and error logic as wlel, for get requests, use queries, for post, delete, patch and put requests, use mutations

(3) Instead of using better auth for authetication, delete better-auth entirely and instead use a custom auth implementation optimized for RBAC

(4) Create 3 roles:
i. admin
ii. driver
iii. manager
iv. Staff

- Create an admin-seed script using prisma that seeds the db with 1 admin user, username "admin", password 12345678 (thus is how users ligcn, using username + password)

- For the root web page /, make it solely responsible for redirecting users based on auth state

- Redircet to /sign-in if the useris not signed in, ldashbaord if signed in and so on