import React from 'react'
import styles from './CardBasic.module.css'
import { useNavigate } from 'react-router-dom';
const CardBasic = (props) => {
     const navigate = useNavigate();

    const handleClick = () => {
        if (props.navigateTo) {
            navigate(props.navigateTo);
        }
    };
    return (
        <div className={`col-12 col-md-6 col-lg-4 `}>
            <div className={`${styles.cardMain}  card rounded-4 p-2 h-100 cursor-pointer`} style={{backgroundColor : props.cardColor}} onClick={handleClick}>
                <div className="card-body">
                    <div className={styles.cardHeading}>
                        <h5 className="card-title fs-6 fw-bold mb-2">{props.cardTitle}</h5>
                    </div>
                    <p className={`${styles.cardText} fw-light card-text`}>

                        {props.cardText}</p>

                </div>
            </div>
        </div>
    )
}

export default CardBasic
