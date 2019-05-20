import React from "react";
import { Link, graphql } from 'gatsby';
import styled from '@emotion/styled';
import { css } from '@emotion/core';

import Pagination from '../components/pagination';

const titleContainerCss = css`
  display: block;
  
  text-decoration: none;
  color: black;

  padding: 30px;
  margin-bottom: 25px;

  border: 1px solid #cacaca;
  border-radius: 5px;
`;

const Title = styled.h3`
  display: inline-block;
  margin-right: 30px;
`;

const Date = styled.h5`
  display: inline-block;
  margin-top:20px;
`;

const Description = styled.p`
  margin: 10px 0 10px;
  line-height: 2.0;
`;

const PostLink = ({ node }) => (
  <div key={node.id}>
    <Link to={node.fields.postName} css={titleContainerCss}>
      <Title>{node.frontmatter.title}</Title>
      <Date>{node.frontmatter.date}</Date>
      <Description>{node.frontmatter.description}</Description>
    </Link>
  </div>
)

export default ({ data, pageContext }) => {
  const posts = data.allMarkdownRemark.edges;
  return (
    <>
      {posts.map((post => <PostLink key={post.node.id} node={post.node} />))}
      <Pagination currentPage={pageContext.currentPage} pagesCount={pageContext.pagesCount} 
        baseUrl="/"/>
    </>
  )
}

export const query = graphql`
  query($skip: Int!, $limit: Int!){
    allMarkdownRemark(
      filter:{fileAbsolutePath:{regex:"/.*\/posts\/.*/"}}
      sort:{fields:frontmatter___date,order:DESC}
      limit:$limit
      skip:$skip
    ){
      edges{
        node{
          id
          frontmatter{
            title
            date
            description
          }
          html
          fields{
            postName
          }
        }
      }
    }
  }
`;