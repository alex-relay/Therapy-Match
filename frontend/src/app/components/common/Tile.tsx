import CardHeader from "@mui/material/CardHeader";
import StyledCard from "./StyledCard";
import CardMedia from "@mui/material/CardMedia";

type TileProps = {
  onTileClick: () => void;
  title: string;
  image?: string;
  alt?: string;
};

const Tile = ({ onTileClick, title, image, alt, ...restProps }: TileProps) => {
  return (
    <StyledCard onClick={onTileClick} variant="outlined" {...restProps}>
      <CardHeader title={title} />
      {image && (
        <CardMedia component="img" height="100px" src={image} alt={alt} />
      )}
    </StyledCard>
  );
};

export default Tile;
