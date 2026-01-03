#!/usr/bin/env python3
"""
Body Measurement Extraction using MediaPipe
Processes front and side images to extract body measurements
"""

import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import cv2
import numpy as np
import json
import sys
import os
import urllib.request

class TailoringMeasurement:
    def __init__(self):
        # Download the pose landmarker model if not exists
        model_path = os.path.join(
            os.path.dirname(__file__),
            'pose_landmarker.task'
        )

        if not os.path.exists(model_path):
            model_url = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task'
            try:
                print(f"Downloading pose model...", file=sys.stderr)
                urllib.request.urlretrieve(model_url, model_path)
                print("Model downloaded successfully", file=sys.stderr)
            except Exception as e:
                raise RuntimeError(f"Failed to download pose model: {e}")

        # Create the pose landmarker using the new API
        base_options = python.BaseOptions(model_asset_path=model_path)
        options = vision.PoseLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.IMAGE,
            min_pose_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

        self.pose = vision.PoseLandmarker.create_from_options(options)
    
    def validate_image(self, image_path):
        """Validate that image exists and is readable"""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Cannot read image: {image_path}")
        
        return image
    
    def calculate_pixel_distance(self, point1, point2, height, width):
        """Calculate Euclidean distance between two landmarks in pixels"""
        x1, y1 = point1.x * width, point1.y * height
        x2, y2 = point2.x * width, point2.y * height
        return np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
    
    def pixels_to_cm(self, pixel_value, actual_height_cm, body_height_pixels):
        """Convert pixel measurements to centimeters"""
        if body_height_pixels == 0:
            return 0
        pixels_per_cm = body_height_pixels / actual_height_cm
        return pixel_value / pixels_per_cm
    
    def get_body_height_pixels(self, landmarks, image_height):
        """Calculate full body height in pixels"""
        nose = landmarks[0]
        left_ankle = landmarks[27]
        right_ankle = landmarks[28]
        
        avg_ankle_y = (left_ankle.y + right_ankle.y) / 2
        body_height = abs(nose.y - avg_ankle_y) * image_height
        
        return body_height
    
    def extract_measurements(self, front_image_path, side_image_path, height_cm, gender='male'):
        """Extract body measurements from images"""
        
        # Validate images
        front_image = self.validate_image(front_image_path)
        side_image = self.validate_image(side_image_path)
        
        # Convert to RGB
        front_rgb = cv2.cvtColor(front_image, cv2.COLOR_BGR2RGB)
        side_rgb = cv2.cvtColor(side_image, cv2.COLOR_BGR2RGB)

        # Convert to MediaPipe Image format
        front_mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=front_rgb)
        side_mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=side_rgb)

        # Process images with new API
        front_results = self.pose.detect(front_mp_image)
        side_results = self.pose.detect(side_mp_image)

        # Check if pose detected
        if not front_results.pose_landmarks or len(front_results.pose_landmarks) == 0:
            return {
                "success": False,
                "error": "Could not detect body pose in front image. Ensure full body is visible."
            }

        if not side_results.pose_landmarks or len(side_results.pose_landmarks) == 0:
            return {
                "success": False,
                "error": "Could not detect body pose in side image. Ensure full body is visible."
            }
        
        # Get image dimensions
        front_h, front_w = front_image.shape[:2]
        side_h, side_w = side_image.shape[:2]

        # Get landmarks (new API returns a list, we take the first detected pose)
        front_lm = front_results.pose_landmarks[0]
        side_lm = side_results.pose_landmarks[0]
        
        # Calculate body height reference
        body_height_px = self.get_body_height_pixels(front_lm, front_h)
        
        if body_height_px < 100:
            return {
                "success": False,
                "error": "Body detection error. Retake photos with full body visible."
            }
        
        measurements = {}
        
        # SHOULDER WIDTH
        left_shoulder = front_lm[11]
        right_shoulder = front_lm[12]
        shoulder_width_px = self.calculate_pixel_distance(
            left_shoulder, right_shoulder, front_h, front_w
        )
        measurements['shoulder_width'] = self.pixels_to_cm(
            shoulder_width_px, height_cm, body_height_px
        )
        
        # CHEST CIRCUMFERENCE
        chest_ratio = 2.5 if gender == 'male' else 2.4
        measurements['chest_circumference'] = measurements['shoulder_width'] * chest_ratio
        
        # WAIST CIRCUMFERENCE
        left_hip = front_lm[23]
        right_hip = front_lm[24]
        hip_width_px = self.calculate_pixel_distance(
            left_hip, right_hip, front_h, front_w
        )
        hip_width_cm = self.pixels_to_cm(hip_width_px, height_cm, body_height_px)
        
        waist_ratio = 2.3 if gender == 'male' else 2.2
        measurements['waist_circumference'] = hip_width_cm * waist_ratio
        
        # HIP CIRCUMFERENCE
        hip_ratio = 2.9 if gender == 'male' else 3.0
        measurements['hip_circumference'] = hip_width_cm * hip_ratio
        
        # SLEEVE LENGTH
        shoulder_side = side_lm[12]
        elbow_side = side_lm[14]
        wrist_side = side_lm[16]
        
        shoulder_to_wrist_px = self.calculate_pixel_distance(
            shoulder_side, wrist_side, side_h, side_w
        )
        measurements['sleeve_length'] = self.pixels_to_cm(
            shoulder_to_wrist_px, height_cm, body_height_px
        )
        
        # UPPER ARM LENGTH
        shoulder_to_elbow_px = self.calculate_pixel_distance(
            shoulder_side, elbow_side, side_h, side_w
        )
        measurements['upper_arm_length'] = self.pixels_to_cm(
            shoulder_to_elbow_px, height_cm, body_height_px
        )
        
        # NECK CIRCUMFERENCE
        left_ear = front_lm[7]
        right_ear = front_lm[8]
        head_width_px = self.calculate_pixel_distance(
            left_ear, right_ear, front_h, front_w
        )
        head_width_cm = self.pixels_to_cm(head_width_px, height_cm, body_height_px)
        measurements['neck_circumference'] = head_width_cm * 2.6
        
        # INSEAM
        hip_side = side_lm[24]
        ankle_side = side_lm[28]
        inseam_px = self.calculate_pixel_distance(
            hip_side, ankle_side, side_h, side_w
        )
        measurements['inseam'] = self.pixels_to_cm(inseam_px, height_cm, body_height_px)
        
        # TORSO LENGTH
        shoulder_front = front_lm[12]
        hip_front = front_lm[24]
        torso_px = self.calculate_pixel_distance(
            shoulder_front, hip_front, front_h, front_w
        )
        measurements['torso_length'] = self.pixels_to_cm(
            torso_px, height_cm, body_height_px
        )
        
        # BICEP CIRCUMFERENCE
        measurements['bicep_circumference'] = measurements['shoulder_width'] * 0.45
        
        # WRIST CIRCUMFERENCE
        measurements['wrist_circumference'] = head_width_cm * 0.8
        
        # THIGH CIRCUMFERENCE
        measurements['thigh_circumference'] = hip_width_cm * 0.95
        
        # Round all measurements
        measurements = {k: round(v, 1) for k, v in measurements.items()}
        
        return {
            "success": True,
            "measurements": measurements,
            "metadata": {
                "height_cm": height_cm,
                "gender": gender,
                "body_height_pixels": round(body_height_px, 1),
                "front_image_size": {"width": front_w, "height": front_h},
                "side_image_size": {"width": side_w, "height": side_h}
            },
            "confidence": {
                "front_detection": True,
                "side_detection": True,
                "landmarks_detected": 33
            }
        }
    
    def cleanup(self):
        """Release resources"""
        self.pose.close()

def main():
    if len(sys.argv) < 4:
        print(json.dumps({
            "success": False,
            "error": "Usage: python body_measurement.py <front_image> <side_image> <height_cm> [gender]"
        }))
        sys.exit(1)
    
    front_image_path = sys.argv[1]
    side_image_path = sys.argv[2]
    height_cm = float(sys.argv[3])
    gender = sys.argv[4] if len(sys.argv) > 4 else 'male'
    
    try:
        processor = TailoringMeasurement()
        result = processor.extract_measurements(
            front_image_path, 
            side_image_path, 
            height_cm,
            gender
        )
        processor.cleanup()
        
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
