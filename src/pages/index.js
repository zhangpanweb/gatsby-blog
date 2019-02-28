import React from "react";
import { Link, graphql } from 'gatsby';
import styled from '@emotion/styled';
import {css} from '@emotion/core';

import Layout from '../components/layout';

const titleContainerCss = css`
  display: flex;
  text-decoration: none;
`;

const Title = styled.h3`
  display: inline-block;
  margin-right: 30px;
`;

const Date = styled.h5`
  display: inline-block;
`;

const PostLink = ({ node }) => (
  <div key={node.id}>
    <Link to={node.fields.postName} css={titleContainerCss}>
      <Title>{node.frontmatter.title}</Title>
      <Date>{node.frontmatter.date}</Date>
    </Link>
    <p>{node.frontmatter.description}</p>
  </div>
)

export default ({ data }) => {
  const posts = data.allMarkdownRemark.edges;
  return (
    <Layout>
      {posts.map((post => <PostLink key={post.node.id} node={post.node} />))}
    </Layout>
  )
}

export const query = graphql`
  query {
    allMarkdownRemark(sort:{fields:frontmatter___date,order:DESC}){
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
`
