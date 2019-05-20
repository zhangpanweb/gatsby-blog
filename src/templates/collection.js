import React from "react";
import { graphql } from 'gatsby';
import { css } from '@emotion/core';

import Layout from '../components/layout';
import Pagination from '../components/pagination';

const containerCss = css`
  display: block;
  
  color: black;

  padding: 15px 30px 30px;
  margin-bottom: 25px;

  border: 1px solid #cacaca;
  border-radius: 5px;

  li{
    margin: 10px 0;
  }
`;

export default ({ data, pageContext }) => {
  const posts = data.allMarkdownRemark.edges;
  return (
    <Layout pageTitle="渊虹小站">
      {posts.map((post => <div key={post.node.id} dangerouslySetInnerHTML={{__html:post.node.html}} css={containerCss} ></div>))}
      <Pagination currentPage={pageContext.currentPage} pagesCount={pageContext.pagesCount} 
        baseUrl="/collections"/>
    </Layout>
  )
}

export const query = graphql`
  query($skip: Int!, $limit: Int!){
    allMarkdownRemark(
      filter:{fileAbsolutePath:{regex:"/.*\/collections\/.*/"}}
      sort:{fields:frontmatter___date,order:DESC}
      limit:$limit
      skip:$skip
    ){
      edges{
        node{
          id
          html
        }
      }
    }
  }
`;