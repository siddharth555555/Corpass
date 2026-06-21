const fs = require("fs");
const path = require("path");

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      results.push(file);
    }
  });
  return results;
};

const files = [
  ...walk("apps/web/src/app/dashboard/admin"),
  ...walk("apps/web/src/components/admin"),
  "apps/web/src/app/login/candi/admin/page.tsx"
];

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  
  // Replace imports
  content = content.replace(/@\/components\//g, "@/components/admin/");
  content = content.replace(/@\/lib\/utils/g, "@/lib/admin-utils");
  content = content.replace(/@\/lib\/mock-data/g, "@/lib/admin-mock-data");
  
  // Replace routing
  content = content.replace(/href="\/dashboard/g, "href=\"/dashboard/admin");
  content = content.replace(/router\.push\("\/dashboard/g, "router.push(\"/dashboard/admin");
  content = content.replace(/router\.push\('\/dashboard/g, "router.push('/dashboard/admin");
  
  fs.writeFileSync(file, content, "utf8");
});
console.log("Replacements done");
