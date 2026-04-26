"""
Question #3: OOP & data structures

Suggested time: 45 minutes

In this question, you will implement a **Gradebook** — a student and course
grade tracker that supports enrollment, grade recording, GPA calculation,
and honor roll queries.

Students are identified by unique student IDs. They must be registered before
they can be enrolled in courses. A student must be enrolled in a course before
a grade can be recorded for that course.

Grades are floating-point values on a 4.0 scale (0.0 to 4.0 inclusive). If a
grade is recorded for a course where the student already has a grade, the new
grade overwrites the previous one.

GPA is computed as the simple average of all graded courses for a student. If
a student is enrolled in courses but has no grades yet, their GPA is None.

The course_average() method returns the average grade across all students who
have received a grade in that course. A course is "known" if any student has
ever been enrolled in it. If the course has enrollees but no grades yet, the
average is None.

The honor roll lists all students whose GPA meets or exceeds a given threshold.
Students must have at least one grade to appear on the honor roll.

It is up to you to decide what data structure(s) to use!

Please implement all methods in the class.

Example usage:
    >>> gb = Gradebook()
    >>> gb.add_student("S001")
    >>> gb.add_student("S002")
    >>> gb.enroll("S001", "Math 101")
    >>> gb.enroll("S001", "CS 101")
    >>> gb.enroll("S002", "Math 101")
    >>> gb.record_grade("S001", "Math 101", 3.7)
    >>> gb.record_grade("S001", "CS 101", 4.0)
    >>> gb.record_grade("S002", "Math 101", 3.5)
    >>> gb.gpa("S001")
    3.85
    >>> gb.course_average("Math 101")
    3.6
    >>> gb.honor_roll(3.8)
    ['S001']
"""

from typing import Optional, List


class Gradebook:
    """A student/course grade tracker with GPA and honor roll support.

    Students must be registered before enrollment, and enrolled in a
    course before grades can be recorded. GPA is the simple average of
    all graded courses. Grades are on a 0.0-4.0 scale.
    """

    # ------------------------------------------------------------------
    # Construction & basic properties
    # ------------------------------------------------------------------
    def __init__(self):
        """Create an empty gradebook."""
        # TODO: Implement!

    def __len__(self) -> int:
        """Return the total number of registered students."""
        return 0  # TODO: Implement!

    # ------------------------------------------------------------------
    # Core API
    # ------------------------------------------------------------------
    def add_student(self, student_id: str) -> None:
        """Register a new student.

        Args:
            student_id: Unique identifier for the student. Must be
                        non-empty.

        Raises:
            ValueError: If student_id is empty or already registered.
        """
        # TODO: Implement!

    def enroll(self, student_id: str, course: str) -> None:
        """Enroll a student in a course.

        Course names are always non-empty strings. No validation is
        needed for course names.

        Args:
            student_id: The student's ID.
            course: The course name.

        Raises:
            KeyError: If the student is not registered.
            ValueError: If the student is already enrolled in that course.
        """
        # TODO: Implement!

    def record_grade(self, student_id: str, course: str, grade: float) -> None:
        """Record or update a grade for a student in a course.

        The student must be enrolled in the course. If a grade was
        previously recorded, it is overwritten.

        Args:
            student_id: The student's ID.
            course: The course name.
            grade: The grade on a 4.0 scale. Must be in [0.0, 4.0].

        Raises:
            KeyError: If the student is not registered.
            ValueError: If the student is not enrolled in the course,
                        or if the grade is outside [0.0, 4.0].
        """
        # TODO: Implement!

    def gpa(self, student_id: str) -> Optional[float]:
        """Calculate a student's GPA.

        GPA is the simple average of grades across all graded courses.

        Args:
            student_id: The student's ID.

        Returns:
            The student's GPA, or None if the student has no grades.

        Raises:
            KeyError: If the student is not registered.
        """
        return None  # TODO: Implement!

    def course_average(self, course: str) -> Optional[float]:
        """Calculate the average grade for a course.

        The average is the arithmetic mean across all students who have
        received a grade in the course. Do not round the result.

        Args:
            course: The course name.

        Returns:
            The average grade as a float, or None if no grades have been
            recorded for this course.

        Raises:
            KeyError: If the course has never had any student enrolled.
        """
        return None  # TODO: Implement!

    # ------------------------------------------------------------------
    # Introspection & maintenance
    # ------------------------------------------------------------------
    def honor_roll(self, min_gpa: float) -> List[str]:
        """Return students whose GPA meets or exceeds the threshold.

        Only students with at least one recorded grade are eligible.

        Args:
            min_gpa: The minimum GPA required for the honor roll.
                     May be any float (no validation needed).

        Returns:
            A sorted list of student IDs (alphabetically, ascending)
            with GPA >= min_gpa. Returns an empty list if no students
            qualify.
        """
        return []  # TODO: Implement!

    def drop_course(self, student_id: str, course: str) -> None:
        """Unenroll a student from a course and delete any recorded grade.

        Args:
            student_id: The student's ID.
            course: The course name.

        Raises:
            KeyError: If the student is not registered.
            ValueError: If the student is not enrolled in the course.
        """
        # TODO: Implement!
