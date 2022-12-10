import styles from './MenuTile.module.css';
import { useNavigate } from "react-router-dom";

interface IProps {
  summary:string,
  description:string,
  url:string
}

function MenuTile(props:IProps) {
  const navigate = useNavigate();
  const { summary, description, url} = props;
  return (
    <div className={styles.menuTile} onClick={() => navigate(url)}>
      <h1>{summary}</h1>
      <p>{description}</p>
    </div>
  );
}

export default MenuTile;