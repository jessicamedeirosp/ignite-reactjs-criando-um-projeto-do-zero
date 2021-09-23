import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from "next/head";
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}: PostProps) {

  const route = useRouter();

  if (route.isFallback) {
    return <p>Carregando...</p>;
  }

  const amountWordsTotalOfContent = RichText.asText(
    post.data.content.reduce((total, data) => [...total, ...data.body], [])
  ).split(' ').length;

  const amountWordsOfContentHeading = post.data.content.reduce(
    (total, data) => {
      if (data.heading) {
        return [...total, data.heading.split(' ')];
      }

      return [...total];
    },
    []
  ).length;

  const readingTime = Math.ceil(
    (amountWordsTotalOfContent + amountWordsOfContentHeading) / 200
  );

  return (
    <>
    <Head>
        <title>{post.data.title} | spacetraveling</title>
    </Head>
    <main className={commonStyles.container}>
        <article className={styles.post}>
            <h1>{post.data.title}</h1>
            <p className={styles.postInfos}>
              <time>
                <FiCalendar /> 
                { format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',      
                    {
                      locale: ptBR,
                    }
                  )
                }
              </time>
              <span>
                <FiUser /> 
                {post.data.author}
              </span>
              <span>
                <FiClock />
                {readingTime} min
              </span>
            </p>          
            {post.data.content.map(content => {
              return (
                <div className={styles.postContent} key={content.heading}>
                  <h2>{content.heading}</h2>
                  <div
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </div>
              );
            })}
        </article>
    </main>
  </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(Prismic.predicates.at['type.posts']);

  const paths = posts.results.map(post => {
    return {
      params: { slug: post.uid },
    };
  });

  return {
    paths,
    fallback: true,
  };
};


export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});  
  
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      ...response.data,
    },
  };


  return {
    props: { post },
    revalidate: 60 * 30,
  }
};
