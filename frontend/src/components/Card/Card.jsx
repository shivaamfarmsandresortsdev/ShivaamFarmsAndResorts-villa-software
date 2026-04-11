import React from 'react'
import styles from './Card.module.css'

const Card = (props) => {
    return (
        <div
            className={` col-12 col-md-6 col-lg-3 `}>
            <div className={`${styles.cardMain}  card rounded-4 p-2 h-100`} onClick={props.onClick}
            style={{ cursor: props.onClick ? 'pointer' : 'default' }}>
                <div className="card-body">
                    <div className={styles.cardHeading}>
                        <h5 className="card-title fs-6 mb-4">{props.cardTitle}</h5>
                        <p className={styles.cardIcon}>
                            {props.cardIcon}
                        </p>
                    </div>
                    <h6 className="card-subtitle  mb-2 fw-bold fs-4">{props.cardSubtitle}</h6>
                    <p className={`${styles.cardText} card-text`}>
                        <span className={props.cardLoss ? 'text-danger' : 'text-success'}>{props.cardTextNum}
                        </span>
                        {props.cardText}</p> 

                </div>
            </div>
        </div>
    )
}

export default Card
