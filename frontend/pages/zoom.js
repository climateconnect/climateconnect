import redirect from "next-redirect"
export default function Zoom() {

}

Zoom.getInitialProps = (ctx) =>{
  return redirect(ctx, "https://fau.zoom.us/j/95027152733")
}