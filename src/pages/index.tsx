import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [currentPage, setCurrentPage] = useState(1);


  async function handleNextPage(): Promise<void> {
    if (currentPage !== 1 && nextPage === null) {
      return;
    }

    const postsResults = await fetch(`${nextPage}`).then(response =>
      response.json()
    );

    setNextPage(postsResults.next_page);
    setCurrentPage(postsResults.page);

    const newPosts = postsResults.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts([...posts, ...newPosts]);
  }
  

  return (
    <>
      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
          <Link  key={post.uid} href={`/post/${post.uid}`}>            
            <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <p>
                  <time>
                    <FiCalendar /> 
                    {post.first_publication_date}
                  </time>
                  <span>
                    <FiUser /> 
                    {post.data.author}
                  </span>
                </p>
            </a>
          </Link>
          ))}
          {nextPage && (
            <button className={styles.buttonMore} type="button" onClick={handleNextPage}>
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient(); 
 
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], { 
    fetch: [
        'posts.title', 
        'posts.subtitle', 
        'posts.author', 
        'posts.banner', 
        'posts.content', 
    ],
    pageSize: 1
  });

  const posts = postsResponse.results.map(post => { 
    return {
        uid: post.uid,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },    
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',      
          {
            locale: ptBR,
          }
        ) 
    }
  });  

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      }
    }
  }
};
