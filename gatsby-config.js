module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      }
    }, 
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
        name: `post`,
        path: `${__dirname}/posts/`
      }
    },
  ]
}