import CardHeader from "@mui/material/CardHeader";
import StyledCard from "./StyledCard";
import { SxProps } from "@mui/material/styles";

type TileProps = {
  onTileClick: () => void;
  title: string;
  isImageDisplayed?: boolean;
  image?: React.JSX.Element;
  alt?: string;
  sx?: SxProps;
};

const Tile = ({
  onTileClick,
  title,
  image,
  isImageDisplayed = false,
  ...restProps
}: TileProps) => {
  return (
    <StyledCard onClick={onTileClick} variant="outlined" {...restProps}>
      <CardHeader title={title} />
      {isImageDisplayed && image}
    </StyledCard>
  );
};

export default Tile;
