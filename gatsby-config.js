module.exports = {
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-emotion`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins:[
          {
            resolve: `gatsby-remark-prismjs`,
          },{
            resolve:`gatsby-remark-images`,
            options:{
              maxWidth: '550',
            }
          }
        ]
      }
    }, 
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/posts/`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `collections`,
        path: `${__dirname}/collections/`
      }
    },
  ]
}