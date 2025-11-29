import PageContainer from "../components/common/PageContainer";
import StyledStack from "../components/common/PageStyledStack";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <PageContainer>
    <StyledStack>{children}</StyledStack>
  </PageContainer>
);

export default Layout;
