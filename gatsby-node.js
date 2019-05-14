const { createFilePath } = require('gatsby-source-filesystem');
const path = require('path');

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const postName = createFilePath({ node, getNode, basePath: `${__dirname}/posts`, trailingSlash: false });
    createNodeField({
      node,
      name: `postName`,
      value: 'post/' + postName.split('/')[2]
    })
  }
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;
  const postTemplate = path.resolve(`src/templates/post.js`);

  return graphql(`
    {
      allMarkdownRemark{
        edges{
          node{
            fields{
              postName
            }
          }
        }
      }
    }
  `).then(result => {
    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
      createPage({
        path: node.fields.postName,
        component: postTemplate,
        context: {
          postName: node.fields.postName
        }
      })
    })

    const posts = result.data.allMarkdownRemark.edges;
    const postsPerPage = 15;
    const pagesCount = Math.ceil(posts.length / postsPerPage);
    Array.from({ length: pagesCount }).forEach((_, i) => {
      createPage({
        path: i === 0 ? '/' : `/${i+1}`,
        component: path.resolve("./src/templates/blog-list.js"),
        context: {
          limit: postsPerPage,
          skip: i * postsPerPage,
          pagesCount,
          currentPage: i + 1
        }
      })
    })
  })
}