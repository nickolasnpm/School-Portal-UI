import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserStatusService } from '../../../template/services/user-status/user-status.service';

interface Module {
  title: string;
  description: string;
  link: string;
}

interface Announcement {
  title: string;
  date: string;
  content: string;
  link: string;
  type: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  providers: [UserStatusService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  modules: Module[] = [
    {
      title: 'Dashboard',
      description:
        'View your personal dashboard with upcoming tasks and activities',
      link: '/dashboard',
    },
    {
      title: 'Courses',
      description: 'Access your enrolled courses and course materials',
      link: '/courses',
    },
    {
      title: 'Assignments',
      description: 'View and submit your assignments',
      link: '/assignments',
    },
    {
      title: 'Grades',
      description: 'Check your grades and academic progress',
      link: '/grades',
    },
  ];

  announcements: Announcement[] = [
    {
      title: 'Spring Break Schedule',
      date: '2025-03-15',
      content:
        'Spring break will be from March 20-28. All classes will resume on March 29.',
      link: '',
      type: 'news',
    },
    {
      title: 'Midterm Examinations',
      date: '2025-03-10',
      content:
        'Midterm examinations will begin next week. Please check your course schedules. ' +
        'Midterm examinations will begin next week. Please check your course schedules. ' +
        'Midterm examinations will begin next week. Please check your course schedules. ' +
        'Midterm examinations will begin next week. Please check your course schedules. ' +
        'Midterm examinations will begin next week. Please check your course schedules. ' +
        'Midterm examinations will begin next week. Please check your course schedules. ',
      link: '',
      type: 'media',
    },
    {
      title: 'Library Extended Hours',
      date: '2025-03-05',
      content: 'The library will have extended hours during midterm week.',
      link: '',
      type: 'announcement',
    },
  ];

  constructor(private _registrationStatusService: UserStatusService) {}

  ngOnInit(): void {
    this._registrationStatusService.userConfiguration();
  }
}
