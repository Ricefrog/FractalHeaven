package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"fractalHeaven/render"
	"github.com/rs/cors"
	"image"
	"image/jpeg"
	"log"
	"net/http"
	"os"
	"time"
)

const (
	WIDTH, HEIGHT = 1024, 1024
	PORT          = "8080"
)

var t bool

func init() {
	flag.BoolVar(&t, "t", false, "Run test stub.")
}

func main() {
	flag.Parse()
	if t {
		testStub()
		return
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/", helloWorld)
	mux.HandleFunc("/api/renderFractal", renderFractal)

	log.Printf("Server started on port %s.\n", PORT)
	handler := cors.Default().Handler(mux)
	http.ListenAndServe(":8080", handler)
}

func helloWorld(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(200)
	w.Write([]byte("hello world!"))
	return
}

type resStruct struct {
	X            float64 `json:"x"`
	Y            float64 `json:"y"`
	Zoom         float64 `json:"zoom"`
	FractalType  string  `json:"fractalType"`
	AntiAliasing bool    `json:"antiAliasing"`
}

func renderFractal(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	log.Println("renderFractal received response.")
	w.Header().Set("Content-Type", "application/json")

	decoder := json.NewDecoder(r.Body)
	var s resStruct
	err := decoder.Decode(&s)
	if err != nil {
		w.WriteHeader(500)
		log.Print(err)
		return
	}

	cx, cy := s.X, s.Y
	boundary := 2.0 / s.Zoom
	xmin, ymin := (cx - boundary), (cy - boundary)
	xmax, ymax := (cx + boundary), (cy + boundary)

	frameInfo := render.ConstructFrameInfo(
		boundary,
		xmin, ymin,
		xmax, ymax,
		cx, cy,
	)

	var img image.Image
	if s.AntiAliasing {
		log.Println("Rendering with anti-aliasing.")
		img = <-render.RenderMFrameAA(WIDTH, HEIGHT, frameInfo)
	} else {
		log.Println("Rendering without anti-aliasing.")
		img = <-render.RenderMFrame(WIDTH, HEIGHT, frameInfo)
	}

	log.Printf("Image rendered. %f s.\n", time.Since(start).Seconds())

	buf := new(bytes.Buffer)
	jpeg.Encode(buf, img, nil)
	encodedImage := base64.StdEncoding.EncodeToString(buf.Bytes())

	responseString := fmt.Sprintf(`{"base64": "%s"}`, encodedImage)
	w.Write([]byte(responseString))
}

func testStub() {
	frameInfo := render.ConstructFrameInfo(float64(2.0), float64(-2.0), float64(-2.0), float64(2.0), float64(2.0), float64(0.0), float64(0.0))
	img := <-render.RenderMFrame(WIDTH, HEIGHT, frameInfo)
	log.Println("Image rendered.")
	jpeg.Encode(os.Stdout, img, nil)

}
