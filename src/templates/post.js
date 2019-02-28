import React from 'react';
import { graphql } from 'gatsby';
import styled from '@emotion/styled';

import Layout from '../components/layout';

const PostTitle = styled.h2`
  margin-bottom: 50px;
`;

export default ({ data }) => {
  const post = data.markdownRemark;
  return (
    <Layout hideHeader={true}>
      <PostTitle>{post.frontmatter.title}</PostTitle>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </Layout>
  )
}

export const query = graphql`
  query($postName:String!) {
    markdownRemark(fields:{postName:{eq:$postName}}){
      html
      frontmatter{
        title
      }
    }
  }
`