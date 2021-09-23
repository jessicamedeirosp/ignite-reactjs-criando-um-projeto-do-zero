import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';
import Link from 'next/link';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={commonStyles.container}>
        <Link href="/">
          <img src="/images/logo.svg" alt="logo" />
        </Link>
      </div>
    </header>
  );
}