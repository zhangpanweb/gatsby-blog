import React from 'react';
import styled from '@emotion/styled';
import { navigate } from 'gatsby';

import leftArrow from '../../static/left.png';
import rightArrow from '../../static/right.png';

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  margin: 30px 0;

  color: #707070;
  &>*{cursor: pointer};
`;

const PrePage = styled.img`
  margin-right: 10px;
  height: 15px;
  padding: 10px 13px;
`;

const NextPage = styled.img`
  margin-left: 10px;
  height: 15px;
  padding: 10px 13px;
`;

const Page = styled.a({
  margin: '0 10px',
  padding: '5px 13px'
}, (props) => {
  const css = {};
  if (props.active) {
    css.border = '1px solid #d2d2d2';
  }
  return css;
});

export default ({ currentPage, pagesCount }) => {
  const handleChangePage = (direction, page) => {
    if (direction === 'prev') {
      if (currentPage === 1) return;
      if (currentPage === 2) {
        navigate("/");
        return;
      }
      navigate(`${currentPage - 1}`);
    }

    if (direction === 'page') {
      if (page === '...') return;
      if (page === 1) {
        navigate('');
        return;
      }
      navigate(`${page}`);
    }

    if (direction === 'next') {
      if (currentPage === pagesCount) return;
      navigate(`${currentPage + 1}`);
    }
  }

  const pages = getPagesArray(currentPage, pagesCount);
  return (
    <PaginationContainer>
      <PrePage src={leftArrow} onClick={() => handleChangePage('prev')} />
      {pages.map((page, index) =>
        <Page key={index} active={page === currentPage} onClick={() => handleChangePage('page', page)}>{page}</Page>
      )}
      <NextPage src={rightArrow} onClick={() => handleChangePage('next')} />
    </PaginationContainer>
  )
}

const getPagesArray = (currentPage, pagesCount) => {
  const displayCount = 5;
  const halfDisplayCount = Math.floor(displayCount / 2);
  const pagesArr = [];
  if (pagesCount < displayCount) {
    Array.from({ length: pagesCount }).forEach((_, i) => pagesArr.push(i + 1));
  } else {
    if (currentPage - halfDisplayCount > 1) {
      pagesArr.push('...');
    }
    Array.from({ length: halfDisplayCount }).forEach((_, i) => pagesArr.push(currentPage - halfDisplayCount + i));

    pagesArr.push(currentPage);

    Array.from({ length: halfDisplayCount }).forEach((_, i) => pagesArr.push(currentPage + i + 1));
    if (currentPage + halfDisplayCount < pagesCount) {
      pagesArr.push('...');
    }
  }
  return pagesArr;
}