# EVora 360° vehicle images

The detail page's 360° tab reads the ordered `view360Frames` array on an EV document. Add only images captured for that exact vehicle model and variant; ordinary gallery photos are not a rotation sequence.

Example manifest:

```json
{
  "view360Frames": [
    "/models/360/tata-nexon-ev/frame-001.webp",
    "/models/360/tata-nexon-ev/frame-002.webp",
    "/models/360/tata-nexon-ev/frame-003.webp"
  ]
}
```

Keep each model's frames in one folder and order them from the default front three-quarter angle around the car. The viewer supports pointer and touch dragging, arrow keys, previous/next controls, and reset. It displays the unavailable message when fewer than two frames are configured. No 360° image sequences are currently included in the project assets or the connected EV records.
