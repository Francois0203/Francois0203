import React from 'react';

/* Styling */
import styles from './Loading.module.css';
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/GeneralWrappers.css';

const Loading = ({ message = 'Loading...' }) => (
	<div className={styles.loadingScreenWrapper}>
		<div className={styles.loaderContainer}>
			<div className={styles.loader}>
				<span className={styles.dot}></span>
				<span className={styles.dot}></span>
				<span className={styles.dot}></span>
				<span className={styles.dot}></span>
			</div>
			<div className={styles.loadingText}>{message}</div>
		</div>
	</div>
);

export default Loading;