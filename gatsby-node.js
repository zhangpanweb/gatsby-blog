const { createFilePath } = require('gatsby-source-filesystem');
const path = require('path');

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark` && node.fileAbsolutePath.match(/.*\/posts\/.*/)) {
    const postName = createFilePath({ node, getNode, basePath: `${__dirname}/posts`, trailingSlash: false });
    createNodeField({
      node,
      name: `postName`,
      value: '/post/' + postName.split('/')[2]
    })
  }
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;
  const postTemplate = path.resolve(`src/templates/post.js`);

  const postPromise = graphql(`
    {
      allMarkdownRemark(
        filter:{fileAbsolutePath:{regex:"/.*\/posts\/.*/"}}
      ){
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
    const postPagesCount = Math.ceil(posts.length / postsPerPage);
    Array.from({ length: postPagesCount }).forEach((_, i) => {
      createPage({
        path: i === 0 ? '/' : `/${i + 1}`,
        component: path.resolve("./src/templates/blog-list.js"),
        context: {
          limit: postsPerPage,
          skip: i * postsPerPage,
          pagesCount: postPagesCount,
          currentPage: i + 1
        }
      })
    })
  })

  const collectionPromise = graphql(`
    {
      allMarkdownRemark(
        filter:{fileAbsolutePath:{regex:"/.*\/collections\/.*/"}}
      ){
        totalCount
      }
    }
  `).then(result => {
    const collectionsCount = result.data.allMarkdownRemark.totalCount;
    const collectionPerPage = 10;
    const collectionsPagesCount = Math.ceil(collectionsCount / collectionPerPage);
    Array.from({ length: collectionsPagesCount }).forEach((_, i) => {
      createPage({
        path: i === 0 ? '/collections' : `/collections/${i + 1}`,
        component: path.resolve("./src/templates/collection.js"),
        context: {
          limit: collectionPerPage,
          skip: i * collectionPerPage,
          pagesCount: collectionsPagesCount,
          currentPage: i + 1
        }
      })
    })
  })

  return Promise.all([postPromise, collectionPromise])
}