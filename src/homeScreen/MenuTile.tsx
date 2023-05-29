import styles from './MenuTile.module.css';
import { useNavigate } from "react-router-dom";

interface IProps {
  summary:string,
  description:string,
  url:string,
  imageUri:string
}

function MenuTile(props:IProps) {
  const navigate = useNavigate();
  const { summary, description, url} = props;
  const divStyle = {
    backgroundImage: `url(${props.imageUri})`,
    backgroundSize: 'cover'
  };
  return (
    <div className={styles.menuTile} style={divStyle} onClick={() => navigate(url)}>
      <h1>{summary}</h1>
      <p>{description}</p>
    </div>
  );
}

export default MenuTile;