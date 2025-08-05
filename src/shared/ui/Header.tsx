import Container from "./Container";
import Widget from "./Widget";

function Header() {
    return (
        <Container>
            <Widget className="py-4 px-6 grid grid-cols-3 items-center">

                <div />

                <div className="flex justify-center text-2xl font-semibold">
                    Smart You
                </div>

                <div className="flex justify-end text-subtext">
                    
                </div>

            </Widget>
        </Container>
    );
}

export default Header;