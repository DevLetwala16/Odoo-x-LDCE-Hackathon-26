import React from 'react';
import { Plane, Compass, Sparkles, MapPin } from 'lucide-react';
import styles from './FlightTransition.module.css';

const FlightTransition = ({ 
  isOpen, 
  title = "Boarding Flight... Welcome Aboard!", 
  subtitle = "Passport validated. Taking off into your global journeys...",
  destination = ""
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.fullScreenSky}>
      {/* Dynamic Animated Clouds & Sky Waypoints */}
      <div className={styles.cloudLayer1} />
      <div className={styles.cloudLayer2} />
      <div className={styles.starField} />

      {/* Diagonal Soaring Flight Route & Jet Plane */}
      <div className={styles.skyFlightStage}>
        <div className={styles.vaporContrail} />
        <div className={styles.giantJetPlane}>
          <Plane size={72} className={styles.jetIcon} />
          <div className={styles.jetEngineGlow} />
        </div>
      </div>

      {/* Floating Status & Destination (Unboxed / Clean Overlay) */}
      <div className={styles.bottomHud}>
        <div className={styles.hudBadge}>
          <Sparkles size={14} className={styles.sparkleIcon} />
          <span>FLIGHT DEPARTURE</span>
        </div>

        <h1 className={styles.hudTitle}>{title}</h1>
        <p className={styles.hudSubtitle}>{subtitle}</p>

        {destination && (
          <div className={styles.destinationPill}>
            <MapPin size={14} />
            <span>DESTINATION: {destination.toUpperCase()}</span>
          </div>
        )}

        <div className={styles.runwayProgress}>
          <div className={styles.runwayFill} />
        </div>
      </div>
    </div>
  );
};

export default FlightTransition;
