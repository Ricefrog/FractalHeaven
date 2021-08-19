package main

import (
	"net/http"
	"github.com/rs/cors"
	"log"
	"fmt"
	"flag"
	"fractalHeaven/render"
	"image/jpeg"
	"os"
	"encoding/json"
)

const (
	WIDTH, HEIGHT = 1024, 1024
	PORT = "8080"
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
	X float64 `json:"x"`
	Y float64 `json:"y"`
	Zoom float64 `json:"zoom"`
	FractalType string `json:"fractalType"`
}

func renderFractal(w http.ResponseWriter, r *http.Request) {
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

	temp := fmt.Sprintf(
		"x: %f y: %f zoom: %f fractalType: %s",
		s.X, s.Y, s.Zoom, s.FractalType,

	)
	responseString := fmt.Sprintf(`{"responseString": "%s"}`, temp)
	w.Write([]byte(responseString))
}

func testStub() {
	frameInfo := render.ConstructFrameInfo(float64(2.0), float64(-2.0), float64(-2.0), float64(2.0), float64(2.0), float64(0.0), float64(0.0))
	img := <-render.RenderMFrame(WIDTH, HEIGHT, frameInfo)
	log.Println("Image rendered.")
	jpeg.Encode(os.Stdout, img, nil)

}
