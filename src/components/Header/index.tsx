import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={commonStyles.container}>
        <img src="/images/logo.svg" alt="spacetraveling" />
      </div>
    </header>
  );
}
