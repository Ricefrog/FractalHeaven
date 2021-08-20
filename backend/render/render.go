package render

import (
	"image"
	"image/color"
	"image/draw"
	_ "image/png"
	"math/cmplx"
	"github.com/lucasb-eyer/go-colorful"
	"log"
	"sync"
)

type FrameInfo struct {
	boundary float64
	xmin float64
	ymin float64
	xmax float64
	ymax float64
	centerX float64
	centerY float64
}

func ConstructFrameInfo(b, xmin, ymin, xmax, ymax, cx, cy float64) FrameInfo {
	return FrameInfo {
		boundary: b,
		xmin: xmin,
		ymin: ymin,
		xmax: xmax,
		ymax: ymax,
		centerX: cx,
		centerY: cy,
	}
}

func (f FrameInfo) Read() (
	float64,
	float64,
	float64,
	float64,
	float64,
	float64,
	float64,
) {
	return f.boundary, f.xmin, f.ymin, f.xmax, f.ymax, f.centerX, f.centerY
}


func mandelbrot(z complex128) color.Color {
	const iterations = 100
	const contrast = 15

	var v complex128
	for n := uint8(0); n < iterations; n++ {
		v = v*v + z
		if cmplx.Abs(v) > 2 {
			return colorful.Hsv(float64(contrast*n), 50, 100)
		}
	}
	return color.Black
}

/*
x1, y1 | x2, y1
x1, y2 | x2, y2
*/
func generateSubpixelCoords(x, y, stepSize float64) [][]float64 {
	ret := make([][]float64, 4)
	for i := 0; i < 4; i++ {
		ret[i] = make([]float64, 2)
	}

	ret[0][0] = x - stepSize
	ret[0][1] = y - stepSize

	ret[1][0] = x + stepSize
	ret[1][1] = y + stepSize

	ret[2][0] = x + stepSize
	ret[2][1] = y - stepSize

	ret[3][0] = x - stepSize
	ret[3][1] = y + stepSize
	return ret
}

func getAverageMandelbrot(coords [][]float64) color.Color {
	allColors := make([]color.Color, 0)
	for i := 0; i < len(coords); i++ {
		x, y := coords[i][0], coords[i][1]
		z := complex(x, y)
		allColors = append(allColors, mandelbrot(z))
	}

	var rSum uint32
	var gSum uint32
	var bSum uint32
	for _, col := range allColors {
		r, g, b, _ := col.RGBA()
		rSum += r
		gSum += g
		bSum += b
	}

	numberOfColors := uint32(len(allColors))
	rAvg := uint8(rSum / numberOfColors)
	gAvg := uint8(gSum / numberOfColors)
	bAvg := uint8(bSum / numberOfColors)
	return color.NRGBA{rAvg, gAvg, bAvg, 255}
}

func combine(
	width, height int, c1, c2, c3, c4 <-chan image.Image,
) <-chan image.Image {
	c := make(chan image.Image)
	go func() {
		var wg sync.WaitGroup
		newImage := image.NewRGBA(image.Rect(0, 0, width, height))

		copy := func(
			dst draw.Image,
			r image.Rectangle,
			src image.Image,
			sp image.Point,
		) {
			draw.Draw(dst, r, src, sp, draw.Src)
			wg.Done()
		}

		wg.Add(4)
		var s1, s2, s3, s4 image.Image
		var ok1, ok2, ok3, ok4 bool

		topLeft := image.Rect(0, 0, width/2, height/2)
		topRight := image.Rect(width/2, 0, width, height/2)
		botLeft := image.Rect(0, height/2, width/2, height)
		botRight := image.Rect(width/2, height/2, width, height)

		for {
			select {
			case s1, ok1 = <-c1:
				go copy(newImage, topLeft, s1, image.Point{0, 0})
			case s2, ok2 = <-c2:
				go copy(newImage, topRight, s2, image.Point{0, 0})
			case s3, ok3 = <-c3:
				go copy(newImage, botLeft, s3, image.Point{0, 0})
			case s4, ok4 = <-c4:
				go copy(newImage, botRight, s4,
						image.Point{0, 0})
			}
			if ok1 && ok2 && ok3 && ok4 {
				break
			}
		}
		wg.Wait()
		c <- newImage
	}()
	return c
}

func renderMBoundsAA(
	width, height int, xmin, ymin, xmax, ymax float64,
) <-chan image.Image {
	log.Printf("rendering bounds (%f, %f), (%f, %f)\n", xmin, ymin, xmax, ymax)
	c := make(chan image.Image)
	stepSize := (xmax - xmin) / float64(width)
	go func() {
		img := image.NewRGBA(image.Rect(0, 0, width, height))
		for py := 0; py < height; py++ {
			y := float64(py)/float64(height)*(ymax-ymin) + ymin
			for px := 0; px < width; px++ {
				x := float64(px)/float64(width)*(xmax-xmin) + xmin
				subs := generateSubpixelCoords(x, y, stepSize/2)
				// Image point (px, py) represents complex value z.
				img.Set(px, py, getAverageMandelbrot(subs))
			}
		}
		c <- img
	}()

	return c
}

func renderMBounds(
	width, height int, xmin, ymin, xmax, ymax float64,
) <-chan image.Image {
	log.Printf("rendering bounds (%f, %f), (%f, %f)\n", xmin, ymin, xmax, ymax)
	c := make(chan image.Image)
	go func() {
		img := image.NewRGBA(image.Rect(0, 0, width, height))
		for py := 0; py < height; py++ {
			y := float64(py)/float64(height)*(ymax-ymin) + ymin
			for px := 0; px < width; px++ {
				x := float64(px)/float64(width)*(xmax-xmin) + xmin
				// Image point (px, py) represents complex value z.
				img.Set(px, py, mandelbrot(complex(x, y)))
			}
		}
		c <- img
	}()

	return c
}

func RenderMFrameAA(width, height int, f FrameInfo) <-chan image.Image {
	boundary, xmin, ymin, _, _, cx, cy := f.Read()
	c1 := renderMBoundsAA(
			width/2,
			height/2,
			xmin,
			ymin,
			xmin + boundary,
			ymin + boundary,
		)
	c2 := renderMBoundsAA(
			width/2, height/2, cx, ymin, cx + boundary, ymin + boundary)
	c3 := renderMBoundsAA(
			width/2, height/2, xmin, cy, xmin + boundary, cy + boundary)
	c4 := renderMBoundsAA(
			width/2, height/2, cx, cy, cx + boundary, cy + boundary)
	return combine(width, height, c1, c2, c3, c4)
}

func RenderMFrame(width, height int, f FrameInfo) <-chan image.Image {
	boundary, xmin, ymin, _, _, cx, cy := f.Read()
	c1 := renderMBounds(
			width/2,
			height/2,
			xmin,
			ymin,
			xmin + boundary,
			ymin + boundary,
		)
	c2 := renderMBounds(
			width/2, height/2, cx, ymin, cx + boundary, ymin + boundary)
	c3 := renderMBounds(
			width/2, height/2, xmin, cy, xmin + boundary, cy + boundary)
	c4 := renderMBounds(
			width/2, height/2, cx, cy, cx + boundary, cy + boundary)
	return combine(width, height, c1, c2, c3, c4)
}
