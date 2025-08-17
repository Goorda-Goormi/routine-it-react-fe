import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ArrowLeft, MessageCircle, Mail, ExternalLink } from 'lucide-react';

interface HelpScreenProps {
  onBack: () => void;
}

export function HelpScreen({ onBack }: HelpScreenProps) {
  const faqData = [
    {
      question: "루틴을 어떻게 생성하나요?",
      answer: "홈 화면 상단의 '+' 버튼을 누르거나 루틴 탭에서 '새 루틴 추가' 버튼을 눌러 루틴을 생성할 수 있습니다. 루틴 이름, 시간, 빈도 등을 설정하세요."
    },
    {
      question: "그룹 참여는 어떻게 하나요?",
      answer: "그룹 탭에서 원하는 그룹을 찾아 '참여하기' 버튼을 누르면 됩니다. 자유참여 그룹은 바로 참여 가능하고, 의무참여 그룹은 추가 조건이 있을 수 있습니다."
    },
    {
      question: "인증은 어떻게 하나요?",
      answer: "그룹 채팅에서 '인증하기' 버튼을 누르고 루틴 수행 내용을 작성하면 됩니다. 사진도 함께 첨부할 수 있습니다."
    },
    {
      question: "의무참여 그룹과 자유참여 그룹의 차이점은?",
      answer: "자유참여 그룹은 언제든 자유롭게 참여할 수 있지만, 의무참여 그룹은 정해진 시간에 인증해야 하며 패널티가 있을 수 있습니다."
    },
    {
      question: "랭킹은 어떻게 계산되나요?",
      answer: "루틴 완료, 연속 달성일, 그룹 활동 등을 종합하여 점수가 계산됩니다. 매일 꾸준히 활동할수록 높은 점수를 얻을 수 있습니다."
    },
    {
      question: "데이터는 어떻게 관리되나요?",
      answer: "모든 데이터는 안전하게 암호화되어 저장됩니다. 설정에서 개인정보 처리방침을 확인하고 데이터를 다운로드할 수 있습니다."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold text-lg">도움말</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* 고객 지원 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">고객 지원</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle className="h-4 w-4 mr-3" />
              1:1 문의하기
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Mail className="h-4 w-4 mr-3" />
              이메일 문의
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
          </CardContent>
        </Card>

        {/* 자주 묻는 질문 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">자주 묻는 질문</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-sm font-medium text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* 앱 사용법 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">앱 사용법</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Button variant="outline" className="w-full justify-start">
              루틴 생성 가이드
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              그룹 활동 가이드
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              인증 방법 안내
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
          </CardContent>
        </Card>

        {/* 업데이트 내역 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">최근 업데이트</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 text-sm">
              <div className="border-l-2 border-primary pl-3">
                <div className="font-medium">v1.0.0 (2025.01.15)</div>
                <div className="text-muted-foreground mt-1">
                  • 초기 버전 출시<br/>
                  • 루틴 관리 기능<br/>
                  • 그룹 활동 기능<br/>
                  • 랭킹 시스템
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 연락처 */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="font-medium">문의사항이 있으신가요?</div>
              <div className="text-sm text-muted-foreground">
                help@routineit.com<br/>
                평일 09:00 - 18:00
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}