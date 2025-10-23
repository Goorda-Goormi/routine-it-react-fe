import React, { useState, useEffect } from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
 import { Button } from '../../components/ui/button';
 import { Badge } from '../../components/ui/badge';
 import { Progress } from '../../components/ui/progress';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
 import { Plus, Target, CheckCircle, Clock, Calendar, TrendingUp, Filter, Camera, Users, Sparkles, User, Group as GroupIcon } from 'lucide-react';
 import type { Routine, Group } from '../../interfaces';
 import type { AuthMessage } from '../../interfaces';
 import { GroupRoutineDialog } from '../../pages/Group/GroupChat/GroupRoutineDialog';
 import { getGroupMembers, requestAuthApproval } from '../../api/group';

 const getTodayDayOfWeek = () => {
   const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
   const today = new Date();
   return dayOfWeek[today.getDay()];
 };

 export interface RecommendedRoutine {
   id: number;
   name: string;
   description: string;
   time: string;
   frequency: string[];
   reminder: boolean;
   goal: string;
   category: string;
   completed: boolean;
   streak: number;
   isGroupRoutine: boolean;
   isPublic: boolean;
 }

 interface RoutineScreenProps {
   onNavigate: (screen: string, params?: any) => void;
   allRoutines: Routine[];
   recommendedRoutines: RecommendedRoutine[]; 
   onTogglePersonalRoutine: (routineId: number) => void;
   onAddRecommendedRoutine: (routine: RecommendedRoutine) => void;
   onOpenAttendanceModal: () => void;
   onOpenStreakModal: (streakDays: number) => void;
   onOpenBadgeModal: (badgeName: string, badgeImage: string) => void;
   //onAddAuthMessage: (groupId: number, data: any, nickname: string, userId: string | number, routineId: number) => void;
   initialUserInfo: { nickname: string; id: number | string; };
   participatingGroups: Group[];
   allGroups: Group[];
   //pendingAuthMessages: { [groupId: number]: AuthMessage[] };
 }

 export function RoutineScreen({ onNavigate, allRoutines, recommendedRoutines, onTogglePersonalRoutine, onAddRecommendedRoutine, onOpenAttendanceModal, onOpenStreakModal, onOpenBadgeModal, initialUserInfo, participatingGroups, allGroups }: RoutineScreenProps) {
   const [activeTab, setActiveTab] = useState('personal');
   const [displayedRecommendations, setDisplayedRecommendations] = useState<RecommendedRoutine[]>([]);
   const [randomizedRecommendations, setRandomizedRecommendations] = useState<RecommendedRoutine[]>([]);
   const [personalFilter, setPersonalFilter] = useState('all');
   const [dayFilter, setDayFilter] = useState('all');
   const [groupFilter, setGroupFilter] = useState('all');
   const [groupCategoryFilter, setGroupCategoryFilter] = useState('all');
   const todayDay = getTodayDayOfWeek();
   const todayRoutines = allRoutines.filter(routine => {
     if (routine.frequency && Array.isArray(routine.frequency)) {
       return routine.frequency.includes(todayDay);
     }
     return false;
   })
   .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

   const getCompletedCount = (routines: Routine[]) => {
     return routines.filter(routine => routine.completed).length;
   };

   const getCompletionRate = (routines: Routine[]) => {
     if (routines.length === 0) return 0;
     return Math.round((getCompletedCount(routines) / routines.length) * 100);
   };

   const personalRoutines = allRoutines
    .filter(routine => !routine.isGroupRoutine)
    .filter(routine => personalFilter === 'all' || routine.category === personalFilter)
    .filter(routine => {
      if (dayFilter === 'all') return true;
      return routine.frequency && Array.isArray(routine.frequency) && routine.frequency.includes(dayFilter);
    })
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

   const groupRoutines = allRoutines
    .filter(routine => routine.isGroupRoutine)
    .filter(routine => groupFilter === 'all' || routine.type === groupFilter)
    .filter(routine => groupCategoryFilter === 'all' || routine.category === groupCategoryFilter)
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

    useEffect(() => {
     const existingRoutineNames = new Set(allRoutines.map(r => r.name));
     const filtered = recommendedRoutines.filter(r => !existingRoutineNames.has(r.name));
     setDisplayedRecommendations(filtered.slice(0, 3));
   }, [allRoutines, recommendedRoutines]);

   const getCategoryEmoji = (category: string) => {
     switch (category) {
      case 'health': return '🏥';
      case 'exercise': return '💪';
      case 'study': return '📚';
      case 'lifestyle': return '🏠';
      case 'hobby': return '🎨';
      default: return '📋';
     }
   };

   const handleRoutineClick = (routine: Routine) => {
     if (routine.isGroupRoutine) {
       const group = allGroups.find(g => g.groupId === routine.id);
       if (group) {
         onNavigate('group-detail', group);
       } else {
         console.error(`Group with ID ${routine.id} not found.`);
         alert("그룹 정보를 찾을 수 없습니다.");
       }
     } else {
       onNavigate('routine-detail', routine);
     }
   };


   const handleAddRoutine = () => {
     onNavigate('create-routine');
   };

   const getButtonOrCheckbox = (routine: Routine) => {
     const groupId = (participatingGroups || []).find(group => 
       group.routines?.some(r => r.id === routine.id)
     )?.groupId;

     if (routine.isGroupRoutine) {
       if (routine.completed) {
         return (
                 <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors p-0 m-0 border-0 bg-green-500">
                     <CheckCircle className="h-5 w-5 text-white" />
                 </div>
             );
       } else {
         return (
           <Button
             onClick={(e) => {
               e.stopPropagation();
               const group = participatingGroups.find(g => g.groupId === routine.id);
               if (group) {
                 onNavigate('group-chat', group);
               }
             }}
             className="w-auto h-8 rounded-full flex items-center justify-center px-3 py-1 text-xs"
             variant="outline"
           >
             <span className="flex items-center">
               {routine.type === '의무참여' && <Camera className="h-3 w-3 mr-1 text-foreground/70" />}
               인증
             </span>
           </Button>
         );
       }
     } else {
       return (
         <button
           onClick={(e) => {
             e.stopPropagation();
             onTogglePersonalRoutine(routine.id);
           }}
           className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors m-0 border-0 ${
             routine.completed ? 'bg-green-500 hover:bg-green-600' : 'border-2 border-muted-foreground/60 hover:border-green-500'
           } !p-0`}
         >
           {routine.completed && <CheckCircle className="h-5 w-5 text-white" />}
         </button>
       );
     }
   };
   
   const renderRoutineCard = (routine: Routine, index: number, isLast: boolean) => (
       <div key={routine.isGroupRoutine ? `group-${routine.id}` : `personal-${routine.id}`}>
           <div
               className="flex items-center justify-between rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
               onClick={() => handleRoutineClick(routine)}
           >
               <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10">
                       <span className="text-xl">{getCategoryEmoji(routine.category)}</span>
                   </div>
                   <div>
                       <div className="flex items-center space-x-2">
                           <span className="flex-1 text-sm text-left font-medium text-card-foreground break-words">{routine.name}</span>
                           {(routine as Routine).isGroupRoutine && (
                               <Users className="h-3 w-3 text-primary icon-accent" />
                           )}
                       </div>
                       <div className="text-left text-xs text-muted-foreground mt-1">
                           {routine.time}
                       </div>
                   </div>
               </div>
               <div className="flex items-center space-x-2">
                   {getButtonOrCheckbox(routine)}
               </div>
           </div>
           {index < allRoutines.length - 1 && <div className="border-b border-border/50 mx-3"></div>}
       </div>
   );
 
   const renderRecommendedCard = (routine: RecommendedRoutine, index: number, isLast: boolean) => (
       <div key={routine.id}>
           <div
               className="flex items-center justify-between rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
               onClick={() => 
                {onAddRecommendedRoutine(routine);
                setActiveTab('personal');
               }}
           >
               <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10">
                       <span className="text-xl">{getCategoryEmoji(routine.category)}</span>
                   </div>
                   <div>
                       <div className="flex items-center space-x-2">
                           <span className="flex-1 text-sm text-left font-medium text-card-foreground break-words">{routine.name}</span>
                       </div>
                       <p className="text-xs text-muted-foreground mt-1">
                           {routine.description}
                       </p>
                   </div>
               </div>
               <Button
                   size="sm"
                   variant="outline"
                   className="text-foreground border-border hover:bg-accent hover:text-foreground ml-3"
                   onClick={(e) => {
                       e.stopPropagation();
                       onAddRecommendedRoutine(routine);
                       setActiveTab('personal');
                      }}
               >
                   <Plus className="h-4 w-4 mr-1 icon-secondary" />
                   추가
               </Button>
           </div>
           {index < recommendedRoutines.length - 1 && <div className="border-b border-border/50 mx-3"></div>}
       </div>
   );

   return (
     <div className="space-y-6 h-full p-4">
       <div className="space-y-4">
         <div className="flex items-center justify-between">
           <div className='flex flex-col items-start ml-6'>
             <h2 className="text-lg font-semibold text-foreground">나의 루틴</h2>
             <p className="text-sm text-foreground dark:opacity-75">꾸준한 습관으로 더 나은 내일을 만들어보세요</p>
           </div>
           <Button 
             variant="outline" 
             size="sm"
             onClick={handleAddRoutine}
             className="text-foreground border-border hover:bg-accent hover:text-foreground mr-6"
           >
             <Plus className="h-4 w-4 mr-1 icon-secondary" />
             루틴 추가
           </Button>
         </div>
         <Card className="m-5 bg-card-yellow-bg dark:border-none dark:card-shadow">
           <CardContent className="p-4">
             <div className="flex items-center space-x-3 mb-3">
               <div className="flex items-center justify-center w-10 h-10 rounded-full bg-progress-card-icon-bg">
                 <Sparkles className="h-5 w-5 text-white" />
               </div>
               <div className="flex-1">
                 <div className="flex items-center justify-between">
                   <span className="text-m font-semibold text-progress-card-text">이런 루틴은 어떠세요?</span>
                 </div>
               </div>
             </div>
             
             {displayedRecommendations.length > 0 && (
              <>
                <div className="border-t border-amber-300/50 dark:border-white/20 my-4"></div>
                <div>
                  <div className="grid grid-cols-3 gap-2">
                    {displayedRecommendations.map((routine) => (
                      <Card key={routine.id} className="bg-card-recommend-bg border-amber-300/50">
                        <CardContent className="p-3 pb-4! text-center flex flex-col items-center justify-between h-full">
                          <div className='flex flex-col items-center'>
                            <span className="text-2xl mt-1 mb-1.5">{getCategoryEmoji(routine.category)}</span>
                            <p className="text-xs font-semibold text-card-foreground leading-tight h-6">
                              {routine.name}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-1 text-foreground border-card-recommend-border! hover:bg-accent hover:text-foreground "
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddRecommendedRoutine(routine);
                                setActiveTab('personal');
                                }}
                          >
                            <Plus className="h-4 w-4 icon-secondary" />
                            추가
                        </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
             )}
           </CardContent>
         </Card>
       </div>
       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 flex flex-col items-center">
         <TabsList className="grid w-full h-auto grid-cols-2">
           <TabsTrigger className="flex-1" value="personal" >
             개인
           </TabsTrigger>
           <TabsTrigger className="flex-1" value="group">
             그룹
           </TabsTrigger>
         </TabsList>
         <TabsContent value="personal" className="mt-4 w-full">
           <Card className="dark:card-shadow">
             <CardHeader className="pb-3 flex flex-row items-center justify-between">
               <CardTitle className="flex items-center space-x-2 text-base">
                 <User className="h-4 w-4 icon-accent" />
                 <span>개인 루틴</span>
               </CardTitle>
               <div className="flex items-center space-x-2">
                 {/* 요일 필터 Select */}
                 <Select value={dayFilter} onValueChange={setDayFilter}>
                  <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue placeholder="요일" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">요일</SelectItem>
                    <SelectItem value="월">월</SelectItem>
                    <SelectItem value="화">화</SelectItem>
                    <SelectItem value="수">수</SelectItem>
                    <SelectItem value="목">목</SelectItem>
                    <SelectItem value="금">금</SelectItem>
                    <SelectItem value="토">토</SelectItem>
                    <SelectItem value="일">일</SelectItem>
                  </SelectContent>
                 </Select>

                <Select value={personalFilter} onValueChange={setPersonalFilter}>
                  <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue placeholder="필터" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">카테고리</SelectItem>
                    <SelectItem value="health">🏥 건강</SelectItem>
                    <SelectItem value="exercise">💪 운동</SelectItem>
                    <SelectItem value="study">📚 학습</SelectItem>
                    <SelectItem value="lifestyle">🏠 생활</SelectItem>
                    <SelectItem value="hobby">🎨 취미</SelectItem>
                  </SelectContent>
                </Select>
               </div>
             </CardHeader>
             <CardContent className="pt-0">
               <div className="space-y-0">
                 {personalRoutines.length > 0 ? (
                   personalRoutines.map((routine, index) => renderRoutineCard(routine, index, index === personalRoutines.length - 1))
                 ) : (
                   <div className="py-8 text-center text-sm text-muted-foreground">
                     {personalFilter === 'all' ? (
                       <>
                         <p>등록된 개인 루틴이 없어요.</p>
                         <p>새로운 개인 루틴을 만들어보세요!</p>
                       </>
                     ) : (
                       <p>해당 카테고리에 맞는 루틴이 없습니다.</p>
                     )}
                   </div>

                 )}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
         <TabsContent value="group" className="mt-4 w-full">
           <Card className="dark:card-shadow">
             <CardHeader className="pb-3 flex flex-row items-center justify-between">
               <CardTitle className="flex items-center space-x-2 text-base">
                 <GroupIcon className="h-4 w-4 icon-accent" />
                 <span>그룹 루틴</span>
               </CardTitle>
               <div className="flex items-center space-x-2">
                 {/* 카테고리 필터 Select */}
                 <Select value={groupCategoryFilter} onValueChange={setGroupCategoryFilter}>
                  <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue placeholder="카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">카테고리</SelectItem>
                    <SelectItem value="health">🏥 건강</SelectItem>
                    <SelectItem value="exercise">💪 운동</SelectItem>
                    <SelectItem value="study">📚 학습</SelectItem>
                    <SelectItem value="lifestyle">🏠 생활</SelectItem>
                    <SelectItem value="hobby">🎨 취미</SelectItem>
                  </SelectContent>
                 </Select>

                 {/* 기존 유형 필터 Select */}
                 <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue placeholder="유형" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">그룹 유형</SelectItem>
                    <SelectItem value="자유참여">자유참여</SelectItem>
                    <SelectItem value="의무참여">의무참여</SelectItem>
                  </SelectContent>
                 </Select>
               </div>
             </CardHeader>
             <CardContent className="pt-0">
               <div className="space-y-0">
                 {groupRoutines.length > 0 ? (
                  groupRoutines.map((routine, index) => renderRoutineCard(routine, index, index === groupRoutines.length - 1))
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                     {groupFilter === 'all' ? (
                       <>
                         <p>참여중인 그룹 루틴이 없어요.</p>
                         <p>새로운 그룹에 참여해보세요!</p>
                       </>
                     ) : (
                       <p>해당 유형에 맞는 그룹 루틴이 없습니다.</p>
                     )}
                   </div>
                )}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   );
 }